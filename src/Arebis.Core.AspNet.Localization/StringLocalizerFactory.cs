using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace Arebis.Core.AspNet.Localization
{
    public class StringLocalizerFactory : IStringLocalizerFactory
    {
        public StringLocalizerFactory(LocalizationService localizationService)
            : this(localizationService, CultureInfo.CurrentUICulture)
        { }

        public StringLocalizerFactory(LocalizationService localizationService, CultureInfo culture)
        {
            this.LocalizationService = localizationService;
            this.Culture = culture;
        }

        public LocalizationService LocalizationService { get; private set; }

        public CultureInfo Culture { get; private set; }

        public IStringLocalizer Create(Type resourceSource)
        {
            return new Localizer(this.LocalizationService, null, null, null, this.Culture);
        }

        public IStringLocalizer Create(string baseName, string location)
        {
            return new Localizer(this.LocalizationService, null, null, null, this.Culture);
        }
    }
}
