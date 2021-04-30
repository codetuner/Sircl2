using Arebis.Core.Localization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Localization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Text;

namespace Arebis.Core.AspNet.Localization
{
    public static class Extensions
    {
        public static void AddArebisLocalization(this IServiceCollection services, IConfiguration configuration, Action<LocalizationOptions> optionsAction)
        {
            //services.AddOptions<LocalizationOptions>();
            //services.Configure<LocalizationOptions>(configuration.GetSection("Localization"));

            services.Configure<LocalizationOptions>(options => {
                configuration.GetSection("Localization").Bind(options);
                if (optionsAction != null) optionsAction(options);
            });

            services.AddSingleton(typeof(LocalizationResourcesProvider));
            services.AddSingleton(typeof(LocalizationService));
            services.AddSingleton<IStringLocalizerFactory, StringLocalizerFactory>();
            services.AddScoped<LocalizationData>();
            services.AddScoped<IStringLocalizer>(provider => 
            {
                var localizationService = provider.GetRequiredService<LocalizationService>();
                var localizationDataSource = provider.GetRequiredService<ILocalizationSource>();
                var data = provider.GetRequiredService<LocalizationData>();
                var contextAccessor = provider.GetRequiredService<IHttpContextAccessor>();
                return new Localizer(localizationService, localizationDataSource, data, contextAccessor);
            });
            services.AddScoped<IHtmlLocalizer>(provider =>
            {
                return provider.GetRequiredService<IStringLocalizer>() as IHtmlLocalizer;
            });
            services.AddScoped<IViewLocalizer>(provider =>
            {
                return provider.GetRequiredService<IStringLocalizer>() as IViewLocalizer;
            });
        }

        public static IApplicationBuilder UseArebisLocalization(this IApplicationBuilder app)
        {
            return app;
        }
    }
}
