using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Data
{
    public class Customer
    {
        public int Id { get; set; }

        public int CountryId { get; set; }

        public Country Country { get; set; }

        [Required]
        public string Name { get; set; }

        public string Address { get; set; }

        public string ZipCode { get; set; }

        public string Town { get; set; }

        [InverseProperty(nameof(Invoice.Customer))]
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

        public Invoice NewInvoice()
        {
            var invoice = new Invoice();
            invoice.Date = DateTime.Now.Date;
            invoice.Customer = this;

            this.Invoices.Add(invoice);
            return invoice;
        }
    }
}
