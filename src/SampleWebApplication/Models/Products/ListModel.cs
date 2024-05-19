using SampleWebApplication.Data;
using System.Collections.Generic;

namespace SampleWebApplication.Models.Products
{
    public class ListModel
    {
        public List<Product> Products { get; set; } = new List<Product>();
    }
}
