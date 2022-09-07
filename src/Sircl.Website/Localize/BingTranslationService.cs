using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Mime;
using System.Threading;
using System.Threading.Tasks;

namespace Sircl.Website.Localize
{
    public class BingTranslationService : ITranslationService, IDisposable
    {
        private const int MaxBatchSize = 0;

        private HttpClient httpClient = null;
        private IConfigurationSection configSection;

        public BingTranslationService(IConfiguration configuration)
        {
            this.configSection = configuration.GetSection("BingApi");
        }

        public Task<IEnumerable<string>> TranslateAsync(string fromLanguage, string toLanguage, string mimeType, IEnumerable<string> sources, CancellationToken? ct = null)
        {
            throw new NotImplementedException();
        }

        protected virtual HttpClient BuildHttpClient()
        {
            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Authorization", configSection["ApiKey"]);
            return httpClient;
        }

        public virtual void Dispose()
        {
            if (httpClient != null)
            {
                this.httpClient.Dispose();
                this.httpClient = null;
            }
        }
    }
}
