using SampleWebApplication.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Models.Invoices
{
    public class UpdateModel : BaseUpdateModel<Invoice>
    {
        public Customer[] Customers { get; internal set; }

        public Product[] Products { get; internal set; }

        public InvoiceLine NewLine { get; set; }
    }
}
