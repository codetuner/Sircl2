using Arebis.Core.AspNet.Localization;
using Arebis.Core.Localization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Sircl.Website.Data;
using Sircl.Website.Localize;
using Sircl.Website.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    Configuration.GetConnectionString("DefaultConnection")));
            services.AddDatabaseDeveloperPageExceptionFilter();

            services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>();
            services.AddControllersWithViews();

            #region Content

            services.AddDbContext<Data.Content.ContentDbContext>(options => {
                //options.LogTo(Startup.WriteDebug);
                options.UseSqlServer(
                    Configuration.GetConnectionString("DefaultConnection"));
            });

            #endregion

            #region Localization

            services.AddDbContext<Data.Localize.LocalizeDbContext>(options =>
                options.UseSqlServer(
                    Configuration.GetConnectionString("DefaultConnection")));

            services.AddLocalizationFromSource(Configuration, options => {
                //options.CompiledDataFileName = "CompiledDataFile.dat";
                options.AllowLocalizeFormat = true;
                options.Domains = new string[] { "Base", "Website" };
            });

            services.AddTransient<ILocalizationSource, DbContextLocalizationSource>();

            //services.AddTransient<ITranslationService, DeepLTranslatorService>();
            services.AddTransient<ITranslationService, GoogleTranslationService>();

            #endregion

            #region Logging

            services.AddDbContext<Data.Logging.LoggingDbContext>(options =>
                options.UseSqlServer(
                    Configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<Sircl.Website.Logging.RequestLogger>();

            #endregion

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            //if (env.IsDevelopment())
            //{
            //    app.UseDeveloperExceptionPage();
            //    app.UseMigrationsEndPoint();
            //}
            //else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            #region Logging
            app.UseArebisRequestLog()
                .LogSlowRequests()
                .LogExceptions()
                .LogNotFounds();
            #endregion

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            #region Localization:
            app.UseLocalizationFromSource();
            #endregion

            app.UseEndpoints(endpoints =>
            {
                //endpoints.MapAreaControllerRoute(null, "MvcDashboardIdentity", "MvcDashboardIdentity/{controller=Home}/{action=Index}/{id?}");

                //endpoints.MapAreaControllerRoute(null, "MvcDashboardContent", "MvcDashboardContent/{controller=Home}/{action=Index}/{id?}");

                endpoints.MapControllerRoute(
                    name: "areas",
                  pattern: "{area:exists}/{controller=Home}/{action=Index}/{id?}"
                );

                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");

                endpoints.MapRazorPages();

                #region Content:
                endpoints.MapControllerRoute(
                    name: "content",
                    pattern: "{**path}",
                    defaults: new { controller = "Content", action = "Render" });
                #endregion
            });
        }

        public static void WriteDebug(string msg)
        {
            System.Diagnostics.Debug.WriteLine(msg);
        }
    }
}
