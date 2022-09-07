using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
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
    /// Following configuration keys are required: "DeepLApi:ServiceUrl" (the service URL to use, i.e. "https://api-free.deepl.com/")
    /// and "DeepLApi:ApiKey" (API key prefixed with "DeepL-Auth-Key ", i.e. "DeepL-Auth-Key 01234567-89ab-cdef-0123-456789abcdef:fx").
    /// </summary>
    public class DeepLTranslationService : ITranslationService, IDisposable
    {
        private const int MaxBatchSize = 50;

        private HttpClient httpClient = null;
        private readonly IConfigurationSection configSection;
        private readonly ILogger logger;

        public DeepLTranslationService(IConfiguration configuration, ILogger<DeepLTranslationService> logger)
        {
            this.configSection = configuration.GetSection("DeepLApi");
            this.logger = logger;
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<string>> TranslateAsync(string fromLanguage, IEnumerable<string> toLanguages, string mimeType, string source, CancellationToken? ct = null)
        {
            var result = new List<string>();
            var sources = new string[] { source };
            foreach (var toLanguage in toLanguages)
            {
                try
                {
                    var texts = await this.TranslateAsync(fromLanguage, toLanguage, mimeType, sources, ct);
                    result.Add(texts.FirstOrDefault());
                }
                catch (Exception)
                {
                    // Since DeepL is very strict on language codes, on failure (i.e. non-supported language) add null:
                    result.Add(null);
                }
            }
            return result;
        }

        /// <inheritdoc/>
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
                    using (var response = await this.httpClient.PostAsync(configSection["TranslationServiceUrl"], content, ct ?? CancellationToken.None))
                    {
                        if (response.IsSuccessStatusCode)
                        {
                            var responseContent = await response.Content.ReadAsStringAsync();
                            var responseData = (TranslateResponse)JsonSerializer.Deserialize<TranslateResponse>(responseContent);
                            foreach (var item in responseData.Translations)
                            {
                                result.Add(item.TranslatedText);
                            }
                        }
                        else
                        {
                            var ex = new InvalidOperationException("DeepLTranslatorService call failed.");
                            ex.Data["StatusCodeName"] = response.StatusCode;
                            ex.Data["StatusCode"] = (int)response.StatusCode;
                            ex.Data["StatusMessage"] = response.ReasonPhrase;
                            ex.Data["Content"] = await response.Content.ReadAsStringAsync();
                            ex.Data["Arg.fromLanguage"] = fromLanguage;
                            ex.Data["Arg.toLanguage"] = toLanguage;
                            ex.Data["Arg.mimeType"] = mimeType;
                            logger.LogError(ex, "Failed to translate using DeepLTranslationService.");
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

        /// <inheritdoc/>
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
                public string TranslatedText { get; set; }
            }
        }
    }
}
