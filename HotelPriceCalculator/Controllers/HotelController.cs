using Microsoft.AspNetCore.Mvc;
using HotelPriceCalculator.Models;
using OfficeOpenXml;
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

            var roomTypes = new List<RoomType>();
            string? fileName = GetFileNameFromHotelName(hotelName);
            if (fileName == null)
            {
                throw new Exception("Hotel name is invalid.");
            }

            using (var package = new ExcelPackage(new FileInfo($"Data/{fileName}")))
            {
                var worksheet = package.Workbook.Worksheets[0];
                for (int row = 8; row <= worksheet.Dimension.Rows; row++) 
                {
                    var roomName = worksheet.Cells[row, 1].Text;
                    if (string.IsNullOrEmpty(roomName)) break;

                    var priceText = worksheet.Cells[row, 3].Text;
                    if (decimal.TryParse(priceText, out decimal price))
                    {
                        roomTypes.Add(new RoomType
                        {
                            Name = roomName,
                            Price = price
                        });
                    }
                }
            }

            return new HotelRoomInfo
            {
                HotelName = hotelName,
                RoomTypes = roomTypes
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
            var roomType = hotelRoomInfo?.RoomTypes.First(rt => rt.Name == request.RoomType);
            if (roomType == null) throw new Exception("Invalid room type.");

            decimal basePrice = roomType.Price;

            decimal totalPrice = basePrice * request.Adults + CalculateChildrenPrice(request.ChildrenAges, request.HotelName) * basePrice;

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
