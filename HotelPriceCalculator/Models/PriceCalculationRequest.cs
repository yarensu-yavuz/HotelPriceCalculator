using System.Collections.Generic;

namespace HotelPriceCalculator.Models
{
    public class PriceCalculationRequest
    {
        public string HotelName { get; set; }
        public string RoomOption { get; set; }
        public string RoomType { get; set; }
        public int Adults { get; set; }
        public List<int> ChildrenAges { get; set; } = new List<int>();
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
