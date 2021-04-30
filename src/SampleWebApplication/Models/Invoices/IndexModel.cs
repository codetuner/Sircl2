using SampleWebApplication.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Models.Invoices
{
    public class IndexModel : BaseIndexModel<Invoice>
    {
        public int? CustomerId { get; set; }

        public int[] Selection { get; set; } = new int[0];
    }
}
