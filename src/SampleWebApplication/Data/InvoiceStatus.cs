using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Data
{
    public enum InvoiceStatus
    {
        Pending = 0,
        AwaitingPayment = 1,
        Paid = 2
    }
}
