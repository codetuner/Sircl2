using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Localization;
using Microsoft.Extensions.Localization;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using Arebis.Core.Localization;

namespace Arebis.Core.AspNet.Localization
{
    public class Localizer : IStringLocalizer, IHtmlLocalizer, IViewLocalizer
    {
        public Localizer(LocalizationService localizationService, ILocalizationSource localizationSource, LocalizationData data, IHttpContextAccessor contextAccessor)
            : this(localizationService, localizationSource, data, contextAccessor, CultureInfo.CurrentUICulture)
        { }

        public Localizer(LocalizationService localizationService, ILocalizationSource localizatioSource, LocalizationData data, IHttpContextAccessor contextAccessor, CultureInfo culture)
        {
            this.LocalizationService = localizationService;
            this.LocalizationSource = localizatioSource;
            this.Data = data;
            this.ContextAccessor = contextAccessor;
            this.Culture = culture;
        }

        public LocalizationService LocalizationService { get; private set; }

        public ILocalizationSource LocalizationSource { get; private set; }

        public LocalizationData Data { get; private set; }

        public IHttpContextAccessor ContextAccessor { get; private set; }

        public CultureInfo Culture { get; private set; }

        LocalizedString IStringLocalizer.this[string name]
        {
            get
            {
                var value = GetRawString(name);
                return (value != null) ? new LocalizedString(name, value) : new LocalizedString(name, name, true);
            }
        }

        LocalizedHtmlString IHtmlLocalizer.this[string name]
        {
            get
            {
                var value = GetRawString(name);
                return (value != null) ? new LocalizedHtmlString(name, value) : new LocalizedHtmlString(name, name, true);
            }
        }

        LocalizedString IStringLocalizer.this[string name, params object[] arguments]
        {
            get
            {
                var value = GetRawString(name, arguments);
                return (value != null) ? new LocalizedString(name, value) : new LocalizedString(name, name, true);
            }
        }

        LocalizedHtmlString IHtmlLocalizer.this[string name, params object[] arguments]
        {
            get
            {
                var value = GetRawString(name, arguments);
                return (value != null) ? new LocalizedHtmlString(name, value) : new LocalizedHtmlString(name, name, true);
            }
        }

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)
        {
            throw new NotImplementedException();
        }

        public LocalizedString GetString(string name)
        {
            var value = GetRawString(name);
            return (value != null) ? new LocalizedString(name, value) : new LocalizedString(name, name, true);
        }

        public LocalizedString GetString(string name, params object[] arguments)
        {
            var value = GetRawString(name, arguments);
            return (value != null) ? new LocalizedString(name, value) : new LocalizedString(name, name, true);
        }

        private string GetRawString(string name)
        {
            return this.GetRawString(name, (object[])null);
        }

        private string GetRawString(string name, params object[] arguments)
        {
            if (this.LocalizationService.Options.AllowLocalizeFormat)
            {
                var userFormat = this.ContextAccessor.HttpContext.Request.Query["__LocalizeFormat"].FirstOrDefault();
                if (userFormat != null)
                {
                    return String.Format(userFormat, name);
                }
            }

            var path = (this.ContextAccessor != null) ? this.ContextAccessor.HttpContext.Request.Path.Value + "/" : null;
            return this.LocalizationService.GetResourceValue(this.LocalizationSource, path, name, arguments, this.Data, this.Culture);
        }

        public IHtmlLocalizer WithCulture(CultureInfo culture)
        {
            return new Localizer(this.LocalizationService, this.LocalizationSource, this.Data, this.ContextAccessor, culture);
        }
    }
}
