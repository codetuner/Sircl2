using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Net.Mime;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Sircl.Website.Localize
{
    /// <summary>
    /// An ITranslationService implementation using Microsoft Bing Translation API.
    /// Following configuration keys are required: "BingApi:SubscriptionKey" (i.e. "0123456789abcdef0123456789abcdef")
    /// and "BingApi:Region" (Azure region, i.e. "centralus", see https://docs.microsoft.com/en-us/azure/media-services/latest/azure-regions-code-names).
    /// </summary>
    public class BingTranslationService : ITranslationService, IDisposable
    {
        private const int MaxBatchSize = 1000;

        private HttpClient httpClient = null;
        private IConfigurationSection configSection;
        private readonly ILogger logger;

        public BingTranslationService(IConfiguration configuration, ILogger<BingTranslationService> logger)
        {
            this.configSection = configuration.GetSection("BingApi");
            this.logger = logger;
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<string>> TranslateAsync(string fromLanguage, string toLanguage, string mimeType, IEnumerable<string> sources, CancellationToken? ct = null)
        {
            var result = new List<string>();
            var responseObjects = await TranslateInternalAsync(fromLanguage, new string[] { toLanguage }, mimeType, sources, ct);
            foreach (var item in responseObjects)
            {
                result.Add(item.Translations[0].TranslatedText);
            }

            return result;
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<string>> TranslateAsync(string fromLanguage, IEnumerable<string> toLanguages, string mimeType, string source, CancellationToken? ct = null)
        {
            var result = new List<string>();
            var responseObjects = await TranslateInternalAsync(fromLanguage, toLanguages, mimeType, new string[] { source }, ct);
            foreach (var textitem in responseObjects[0].Translations)
            {
                result.Add(textitem.TranslatedText);
            }

            return result;
        }

        protected virtual async Task<List<TranslateResponseItem>> TranslateInternalAsync(string fromLanguage, IEnumerable<string> toLanguages, string mimeType, IEnumerable<string> sources, CancellationToken? ct = null)
        {
            var result = new List<TranslateResponseItem>();
            var sourcesEnumerator = sources.GetEnumerator();
            while (true)
            {
                var sourcesBatch = new List<string>();
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
                    var requestObject = new List<TranslateRequestItem>();

                    foreach (var text in sourcesBatch)
                    {
                        requestObject.Add(new TranslateRequestItem { Text = text });
                    }

                    ct?.ThrowIfCancellationRequested();

                    this.httpClient ??= BuildHttpClient();
                    var textType = (mimeType == MediaTypeNames.Text.Plain) ? "plain" : (mimeType == MediaTypeNames.Text.Html) ? "html" : null;
                    var url = (configSection["TranslationServiceUrl"] ?? "https://api.cognitive.microsofttranslator.com/translate") + $"?api-version=3.0&from={fromLanguage}&to={String.Join("&to=", toLanguages)}&textType={textType}";
                    using (var response = await this.httpClient.PostAsJsonAsync(url, requestObject, ct ?? CancellationToken.None))
                    {
                        if (response.IsSuccessStatusCode)
                        {
                            var responseContent = await response.Content.ReadAsStringAsync();
                            var responseObjects = (TranslateResponseItem[])JsonSerializer.Deserialize<TranslateResponseItem[]>(responseContent);
                            result.AddRange(responseObjects);
                        }
                        else
                        {
                            var ex = new InvalidOperationException("BingTranslateService call failed.");
                            ex.Data["StatusCodeName"] = response.StatusCode;
                            ex.Data["StatusCode"] = (int)response.StatusCode;
                            ex.Data["StatusMessage"] = response.ReasonPhrase;
                            ex.Data["Content"] = await response.Content.ReadAsStringAsync();
                            ex.Data["Arg.fromLanguage"] = fromLanguage;
                            ex.Data["Arg.toLanguages"] = String.Join(", ", toLanguages);
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
            httpClient.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", configSection["SubscriptionKey"]);
            httpClient.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Region", configSection["Region"]);
            return httpClient;
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

        public class TranslateRequestItem
        {
            /// <summary>
            /// The text to translate.
            /// </summary>
            [JsonPropertyName("Text")]
            public string Text { get; set; }
        }

        public class TranslateResponseItem
        {
            [JsonPropertyName("translations")]
            public TranslationDataItem[] Translations { get; set; }

            public class TranslationDataItem
            {
                [JsonPropertyName("text")]
                public string TranslatedText { get; set; }
            }
        }
    }
}
