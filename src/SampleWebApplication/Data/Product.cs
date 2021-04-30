using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Data
{
    public class Product
    {
        public int Id { get; set; }

        [Required]
        public string Label { get; set; }

        public long Barcode { get; set; }

        public string Description { get; set; }

        public decimal UnitPrice { get; set; }

        [InverseProperty(nameof(ProductAttribute.Product))]
        public List<ProductAttribute> Attributes { get; set; } = new List<ProductAttribute>();
    }
}
