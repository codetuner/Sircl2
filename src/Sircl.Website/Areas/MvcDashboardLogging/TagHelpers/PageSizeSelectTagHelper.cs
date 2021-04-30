using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardLogging.TagHelpers
{
    [HtmlTargetElement("pagesize-select", Attributes = "asp-for")]
    public class PageSizeSelectTagHelper : SelectTagHelper
    {
        public PageSizeSelectTagHelper(IHtmlGenerator generator) : base(generator)
        { }

        [HtmlAttributeName("asp-sizes")]
        public string Sizes { get; set; } = "5 10 25 50 100 250";

        public override void Init(TagHelperContext context)
        {
            var sizes = this.Sizes.Split(' ').Select(s => Convert.ToInt32(s)).ToList();
            var value = Convert.ToInt32(For.Model);
            if (!sizes.Contains(value)) sizes.Add(value);
            var values = sizes.Select(s => new SelectListItem() { Value = s.ToString(), Text = s.ToString(), Selected = (s == value) }).ToList();

            this.Items = values;

            base.Init(context);
        }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = "select";
            base.Process(context, output);
        }
    }
}
