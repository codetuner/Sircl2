using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Models
{
    public abstract class BaseUpdateModel<T>
    {
        public T Item { get; set; }
    }
}
