using SampleWebApplication.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Models.Customers
{
    public class UpdateModel : BaseUpdateModel<Customer>
    {
        public Country[] Countries { get; internal set; }
    }
}
