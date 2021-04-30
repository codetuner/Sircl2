using Arebis.Core.Localization;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;

namespace Arebis.Core.AspNet.Localization
{
    public class LocalizationService
    {
        private Object SyncObject = new object();

        public LocalizationService(LocalizationResourcesProvider dataProvider, IOptions<LocalizationOptions> localizationOptions, IOptions<RequestLocalizationOptions> requestLocalizationOptions)
        {
            this.Options = localizationOptions.Value;
            this.DataProvider = dataProvider;
            this.FallbackCulture = requestLocalizationOptions.Value.DefaultRequestCulture.UICulture;
            this.FallbackToParentCultures = requestLocalizationOptions.Value.FallBackToParentUICultures;

            if (!String.IsNullOrEmpty(localizationOptions.Value.CompiledDataFileName))
            {
                lock (this.SyncObject)
                {
                    try
                    {
                        using (var stream = new FileStream(localizationOptions.Value.CompiledDataFileName, FileMode.Open, FileAccess.Read))
                        {
                            this.DataProvider.LoadResources(stream);
                        }
                    }
                    catch (FileNotFoundException)
                    {
                        // Lazy reload from source
                    }
                }
            }
            else
            {
                // Lazy reload from source
            }
        }

        public LocalizationOptions Options { get; set; }

        public LocalizationResourcesProvider DataProvider { get; private set; }
        
        public CultureInfo FallbackCulture { get; private set; }

        public bool FallbackToParentCultures { get; private set; }

        public virtual string GetResourceValue(ILocalizationSource dataSource, string path, string key, object[] parameters, LocalizationData data, CultureInfo culture)
        {
            if (this.DataProvider.HasResources == false && dataSource != null)
            {
                lock (this.SyncObject)
                {
                    if (this.DataProvider.HasResources == false)
                    {
                        this.ReloadFromSource(dataSource);
                    }
                }
            }
            if (this.DataProvider.HasResources == true)
            {
                return this.DataProvider.GetResourceValue(path, key, parameters, data, culture, FallbackCulture, FallbackToParentCultures);
            }
            else
            {
                return key;
            }
        }

        public virtual void ReloadFromSource(ILocalizationSource dataSource)
        {
            var newData = dataSource.BuildResources();
            if (newData != null)
            {
                newData.Compile();
                DataProvider.SetResources(newData);
                if (!String.IsNullOrEmpty(Options.CompiledDataFileName))
                {
                    using (var stream = new FileStream(Options.CompiledDataFileName, FileMode.Create, FileAccess.Write))
                    {
                        this.DataProvider.SaveResources(stream);
                    }
                }
            }
        }
    }
}
