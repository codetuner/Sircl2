using Arebis.Core.AspNet.Localization;
using Arebis.Core.Localization;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Sircl.Website.Data.Localize;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Localize
{
    public class LocalizationSource : ILocalizationSource
    {
        public LocalizationSource(IConfiguration configuration, LocalizeDbContext context, IOptions<LocalizationOptions> localizationOptions)
        {
            this.Context = context;
            this.Options = localizationOptions.Value;
            this.Configuration = configuration;
        }

        public LocalizeDbContext Context { get; private set; }

        public LocalizationOptions Options { get; private set; }

        public IConfiguration Configuration { get; private set; }

        public IServiceProvider ServiceProvider { get; private set; }

        public LocalizationResources BuildResources()
        {
            var data = new LocalizationResources();

            foreach (var domainName in Options.Domains)
            {
                var domain = Context.LocalizeDomains.SingleOrDefault(d => d.Name == domainName);
                if (domain == null) continue;
                if (domain.Cultures == null) continue;

                // Retrieve cultures (no "'" allowed to prevent SQL Injection when using queries):
                var cultures = domain.Cultures.Replace('\'', '*').Split(',').Select(s => s.Trim()).Where(s => s.Length > 0).ToArray();
                if (cultures.Length == 0) continue;

                // Create keys from queries:
                foreach (var query in Context.LocalizeQueries.Where(q => q.DomainId == domain.Id))
                {
                    using (var conn = new SqlConnection(Configuration.GetConnectionString(query.ConnectionName)))
                    using (var cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = query.Sql
                            .Replace("{cultures}", String.Join("','", cultures));

                        if (conn.State == System.Data.ConnectionState.Closed) conn.Open();

                        using (var reader = cmd.ExecuteReader())
                        {
                            var keyCount = (reader.GetColumnSchema().Count - 1) / 2;
                            while (reader.Read())
                            {
                                var culture = reader.GetString(0);
                                if (cultures.Contains(culture))
                                {
                                    for (int c = 0; c < keyCount; c++)
                                    {
                                        var key = reader.GetString(c * 2 + 1);
                                        var value = reader.GetString(c * 2 + 2);
                                        data.AddResourceValue(key, culture, value);
                                    }
                                }
                            }
                        }
                    }
                }

                // Create keys from keys:
                foreach (var key in Context.LocalizeKeys.Include(k => k.Values).Where(k => k.DomainId == domain.Id))
                {
                    var resource = new LocalizationResource();
                    resource.ForPath = key.ForPath;
                    var namedParameters = (key.ParameterNames ?? "").Split(',').Select(s => s.Trim()).Where(s => s.Length > 0).ToArray();
                    foreach (var value in key.Values)
                    {
                        if (value.Value == null && value.Reviewed == false) continue;
                        if (cultures.Contains(value.Culture))
                        {
                            if (namedParameters.Length > 0)
                            {
                                for (int i = 0; i < namedParameters.Length; i++)
                                {
                                    value.Value = (value.Value ?? "").Replace("{" + namedParameters[i], "{" + i);
                                }
                            }
                            resource.Values[value.Culture] = (value.Value ?? "");
                        }
                    }
                    data.AddResource(key.Name, resource);
                }
            }

            return data;
        }
    }
}
