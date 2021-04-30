using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Data
{
    public class ProductAttribute
    {
        public int ProductId { get; set; }

        public Product Product { get; set; }

        public string Type { get; set; }

        public string Value { get; set; }
    }
}
