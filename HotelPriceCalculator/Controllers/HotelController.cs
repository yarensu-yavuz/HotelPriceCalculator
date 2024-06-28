using Microsoft.AspNetCore.Mvc;
using HotelPriceCalculator.Models;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace HotelPriceCalculator.Controllers
{
    public class HotelController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult GetHotels()
        {
            try
            {
                var hotels = GetHotelsFromExcel();
                return Json(hotels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message} - {ex.StackTrace}");
            }
        }

        [HttpGet]
        public IActionResult GetHotelRoomInfo(string hotelName)
        {
            try
            {
                var hotelRoomInfo = GetHotelRoomInfoFromExcel(hotelName);
                return Json(hotelRoomInfo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message} - {ex.StackTrace}");
            }
        }

        [HttpPost]
        public IActionResult CalculatePrice([FromBody] PriceCalculationRequest request)
        {
            try
            {
                var totalPrice = CalculateTotalPrice(request);
                return Json(totalPrice);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message} - {ex.StackTrace}");
            }
        }

        private List<Hotel> GetHotelsFromExcel()
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            var hotels = new List<Hotel>();
            var filePaths = Directory.GetFiles("Data", "*.xlsx");
            foreach (var filePath in filePaths)
            {
                using (var package = new ExcelPackage(new FileInfo(filePath)))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    var hotelName = Path.GetFileNameWithoutExtension(filePath); 
                    if (!string.IsNullOrEmpty(hotelName))
                    {
                        hotels.Add(new Hotel
                        {
                            Name = hotelName
                        });
                    }
                }
            }

            return hotels;
        }

        private HotelRoomInfo? GetHotelRoomInfoFromExcel(string hotelName)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            var roomOptions = new List<RoomOption>();
            var seasons = new List<Season>();
            string? fileName = GetFileNameFromHotelName(hotelName);
            if (fileName == null)
            {
                throw new Exception("Hotel name is invalid.");
            }

            using (var package = new ExcelPackage(new FileInfo($"Data/{fileName}")))
            {
                var worksheet = package.Workbook.Worksheets[0];
             
                for (int row = 10; row <= worksheet.Dimension.Rows; row++)
                {
                    var roomName = worksheet.Cells[row, 1].Text;
                    if (string.IsNullOrEmpty(roomName)) break;

                    var roomTypes = new List<RoomType>();
                    for (int col = 2; col < worksheet.Dimension.Columns; col += 3)
                    {
                        var roomTypeName = worksheet.Cells[row, col].Text;
                        var priceText = worksheet.Cells[row, col + 1].Text;
                        var multiplierText = worksheet.Cells[row, col + 2].Text;

                        if (decimal.TryParse(priceText, out decimal price) && decimal.TryParse(multiplierText, out decimal multiplier))
                        {
                            roomTypes.Add(new RoomType
                            {
                                Name = roomTypeName,
                                Price = price,
                                Multiplier = multiplier
                            });
                        }
                    }

                    roomOptions.Add(new RoomOption
                    {
                        RoomName = roomName,
                        RoomTypes = roomTypes
                    });
                }

                // Sezon bilgileri
                for (int col = 3; col < worksheet.Dimension.Columns; col += 2)
                {
                    var seasonName = worksheet.Cells[7, col].Text;
                    var startDateText = worksheet.Cells[7, col].Text;
                    var endDateText = worksheet.Cells[7,col + 1].Text;

                    if (DateTime.TryParse(startDateText, out DateTime startDate) && DateTime.TryParse(endDateText, out DateTime endDate))
                    {
                        seasons.Add(new Season
                        {
                            SeasonName = seasonName,
                            StartDate = startDate,
                            EndDate = endDate,
                            Price = roomOptions.FirstOrDefault()?.RoomTypes.FirstOrDefault()?.Price ?? 0
                        });
                    }
                }
            }

            return new HotelRoomInfo
            {
                HotelName = hotelName,
                RoomOptions = roomOptions,
                Seasons = seasons
            };
        }

        private string? GetFileNameFromHotelName(string hotelName)
        {
            switch (hotelName.ToUpper())
            {
                case "ROSE GARDEN PREMIUM HOTEL":
                    return "ROSE GARDEN PREMIUM HOTEL.xlsx";
                case "FUN SUN CLUB SAPHIRE":
                    return "FUN SUN CLUB SAPHIRE.xlsx";
                case "HOLIDAY INN RESORT BODRUM":
                    return "HOLIDAY INN RESORT BODRUM.xlsx";
                case "MARVIDA HOTEL AKMAN PARK":
                    return "MARVIDA HOTEL AKMAN PARK.xlsx";
                default:
                    return null;
            }
        }

        private decimal CalculateTotalPrice(PriceCalculationRequest request)
        {
            var hotelRoomInfo = GetHotelRoomInfoFromExcel(request.HotelName);
            var roomOption = hotelRoomInfo?.RoomOptions.FirstOrDefault(ro => ro.RoomName == request.RoomOption);
            var roomType = roomOption?.RoomTypes.FirstOrDefault(rt => rt.Name == request.RoomType);
            if (roomType == null) throw new Exception("Invalid room type.");

            decimal totalPrice = 0;

            for (DateTime date = request.StartDate; date <= request.EndDate; date = date.AddDays(1))
            {
                var season = hotelRoomInfo.Seasons.FirstOrDefault(s => date >= s.StartDate && date <= s.EndDate);
                if (season != null)
                {
                    totalPrice += season.Price * roomType.Multiplier;
                    totalPrice += CalculateChildrenPrice(request.ChildrenAges, request.HotelName) * roomType.Price;
                }
            }

            return totalPrice;
        }

        private int CalculateChildrenPrice(List<int> childrenAges, string hotelName)
        {
            int childPrice = 0;
            string? fileName = GetFileNameFromHotelName(hotelName);
            if (string.IsNullOrEmpty(fileName))
            {
                throw new Exception("Invalid hotel name");
            }

            using (var package = new ExcelPackage(new FileInfo($"Data/{fileName}")))
            {
                var worksheet = package.Workbook.Worksheets[0];
                int ageLimit = int.Parse(worksheet.Cells[1, 3].Text); 
                foreach (var age in childrenAges)
                {
                    if (age > ageLimit)
                    {
                        childPrice++;
                    }
                }
            }
            return childPrice;
        }
    }
}
