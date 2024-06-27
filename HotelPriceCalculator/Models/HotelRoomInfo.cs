
using System.Collections.Generic;
namespace HotelPriceCalculator.Models
{
    
  public class HotelRoomInfo
        {
            public string HotelName { get; set; } = string.Empty;
            public List<RoomType> RoomTypes { get; set; } = new List<RoomType>();
        }
    }
