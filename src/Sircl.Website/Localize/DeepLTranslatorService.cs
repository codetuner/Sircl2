using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Net.Http;
using System.Net.Mime;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Sircl.Website.Localize
{
    /// <summary>
    /// An ITranslationService implementation using DeepL.com API.
    /// Following configuration keys are required: "DeepL:ServiceUrl" (the service URL to use, i.e. "https://api-free.deepl.com/")
    /// and "DeepL:ApiKey" (API key prefixed with "DeepL-Auth-Key ", i.e. "DeepL-Auth-Key 01234567-89ab-cdef-0123-456789abcdef:fx").
    /// </summary>
    public class DeepLTranslatorService : ITranslationService, IDisposable
    {
        private const int MaxBatchSize = 50;

        private HttpClient httpClient = null;
        private IConfigurationSection configSection;

        public DeepLTranslatorService(IConfiguration configuration)
        {
            this.configSection = configuration.GetSection("DeepL");
        }

        public async Task<IEnumerable<string>> TranslateAsync(string fromLanguage, string toLanguage, string mimeType, IEnumerable<string> sources, CancellationToken? ct = null)
        {
            var result = new List<string>();
            var sourcesEnumerator = sources.GetEnumerator();
            while (true)
            {
                var sourcesBatch  =new List<string>();
                for (int i = 0; i < MaxBatchSize; i++)
                {
                    if (sourcesEnumerator.MoveNext())
                    {
                        sourcesBatch.Add(sourcesEnumerator.Current);
                    }
                    else
                    {
                        break;
                    }
                }

                if (sourcesBatch.Count > 0)
                {
                    var data = BuildData(mimeType);
                    data.Add(new KeyValuePair<string, string>("source_lang", fromLanguage));
                    data.Add(new KeyValuePair<string, string>("target_lang", toLanguage));
                    foreach (var text in sourcesBatch)
                    {
                        data.Add(new KeyValuePair<string, string>("text", text));
                    }
                    var content = new FormUrlEncodedContent(data);

                    ct?.ThrowIfCancellationRequested();

                    this.httpClient ??= BuildHttpClient();
                    using (var response = await this.httpClient.PostAsync(new Uri(new Uri(configSection["ServiceUrl"]), "/v2/translate"), content, ct ?? CancellationToken.None))
                    {
                        if (response.IsSuccessStatusCode)
                        {
                            var responseContent = await response.Content.ReadAsStringAsync();
                            var responseData = (TranslateResponse)JsonSerializer.Deserialize<TranslateResponse>(responseContent);
                            foreach (var item in responseData.Translations)
                            {
                                result.Add(item.Text);
                            }
                        }
                        else
                        {
                            var ex = new InvalidOperationException("DeepLTranslatorService call failed.");
                            ex.Data["StatusCodeName"] = response.StatusCode;
                            ex.Data["StatusCode"] = (int)response.StatusCode;
                            ex.Data["StatusMessage"] = response.ReasonPhrase;
                            ex.Data["Content"] = await response.Content.ReadAsStringAsync();
                            throw ex;
                        }
                    }
                }
                else
                {
                    break;
                }
            }

            return result;
        }

        protected virtual HttpClient BuildHttpClient()
        {
            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Authorization", configSection["ApiKey"]);
            return httpClient;
        }

        protected virtual List<KeyValuePair<string,string>> BuildData(string mimeType)
        {
            var data = new List<KeyValuePair<string, string>>();
            if (mimeType == MediaTypeNames.Text.Xml)
            {
                data.Add(new KeyValuePair<string, string>("tag_handling", "xml"));
            }
            else if (mimeType == MediaTypeNames.Text.Html)
            {
                data.Add(new KeyValuePair<string, string>("tag_handling", "html"));
            }
            return data;
        }

        public virtual void Dispose()
        {
            if (httpClient != null)
            {
                this.httpClient.Dispose();
                this.httpClient = null;
            }
        }

        public class TranslateResponse
        {
            [JsonPropertyName("translations")]
            public Translation[] Translations { get; set; }

            public class Translation
            {
                [JsonPropertyName("text")]
                public string Text { get; set; }
            }
        }
    }
}
