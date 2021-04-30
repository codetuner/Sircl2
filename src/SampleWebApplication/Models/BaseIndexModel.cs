using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Models
{
    public class BaseIndexModel<T>
    {
        public T[] Items { get; internal set; } = new T[0];

        public int ItemCount { get; internal set; } = 0;

        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 10;
        
        public int PageCount => ((this.ItemCount + this.PageSize - 1) / this.PageSize);

        public string Query { get; set; }
    }
}
