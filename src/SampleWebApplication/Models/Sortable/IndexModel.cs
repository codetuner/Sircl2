using System.Collections.Generic;

namespace SampleWebApplication.Models.Sortable
{
    public class IndexModel
    {
        public List<string> Items { get; internal set; }
        public List<string> Screen { get; internal set; }
        public List<KeyValuePair<string, string>> Controls { get; internal set; }
    }
}
