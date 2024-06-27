using System.Collections.Generic;

namespace HotelPriceCalculator.Models
{
    public class PriceCalculationRequest
    {
        public string HotelName { get; set; } = string.Empty;
        public string RoomType { get; set; } = string.Empty;
        public int Adults { get; set; }
        public int Children { get; set; }
        public List<int> ChildrenAges { get; set; } = new List<int>();
    }
}
