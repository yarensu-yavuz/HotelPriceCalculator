
using System.Collections.Generic;

    namespace HotelPriceCalculator.Models
    {
        public class HotelRoomInfo
        {
            public string HotelName { get; set; }
            public List<RoomOption> RoomOptions { get; set; }
            public List<Season> Seasons { get; set; }
        }

        public class RoomOption
        {
            public string RoomName { get; set; }
            public List<RoomType> RoomTypes { get; set; }
        }

        public class Season
        {
            public string SeasonName { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
            public decimal Price { get; set; }
        }
    }
