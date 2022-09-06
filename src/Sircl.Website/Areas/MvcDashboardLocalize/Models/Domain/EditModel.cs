using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardLocalize.Models.Domain
{
    public class EditModel : BaseEditModel<Data.Localize.Domain>
    {
        [Required]
        public string Cultures { get; set; }
    }
}
