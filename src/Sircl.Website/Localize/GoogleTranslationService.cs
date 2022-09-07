using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
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
    /// An ITranslationService implementation using basic Google Cloud Translation API.
    /// Following configuration key is required: "GoogleApi:ApiKey" (i.e. "AbCdEfG81jKlMn0pQrStU4w-4BcDeFgH12kLmNo").
    /// </summary>
    public class GoogleTranslationService : ITranslationService, IDisposable
    {
        private const int MaxBatchSize = 128;

        private HttpClient httpClient = null;
        private IConfigurationSection configSection;
        private readonly ILogger logger;

        public GoogleTranslationService(IConfiguration configuration, ILogger<GoogleTranslationService> logger)
        {
            this.configSection = configuration.GetSection("GoogleApi");
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
                    // Since Google is strict on translation language pairs, on failure add null:
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
                    var requestObject = new TranslateRequest()
                    {
                        SourceLanguage = fromLanguage,
                        TargetLanguage = toLanguage,
                        Format = (mimeType == MediaTypeNames.Text.Plain) ? "text" : (mimeType == MediaTypeNames.Text.Html) ? "html" : null
                    };

                    foreach (var text in sourcesBatch)
                    {
                        requestObject.Texts.Add(text);
                    }

                    ct?.ThrowIfCancellationRequested();

                    this.httpClient ??= BuildHttpClient();
                    using (var response = await this.httpClient.PostAsJsonAsync((configSection["TranslationServiceUrl"] ?? "https://translation.googleapis.com/language/translate/v2") + "?key=" + configSection["ApiKey"], requestObject, ct ?? CancellationToken.None))
                    {
                        if (response.IsSuccessStatusCode)
                        {
                            var responseContent = await response.Content.ReadAsStringAsync();
                            var responseObject = (TranslateResponse)JsonSerializer.Deserialize<TranslateResponse>(responseContent);
                            foreach (var item in responseObject.Data?.Translations)
                            {
                                result.Add(item.TranslatedText);
                            }
                        }
                        else
                        {
                            var ex = new InvalidOperationException("GoogleTranslateService call failed.");
                            ex.Data["StatusCodeName"] = response.StatusCode;
                            ex.Data["StatusCode"] = (int)response.StatusCode;
                            ex.Data["StatusMessage"] = response.ReasonPhrase;
                            ex.Data["Content"] = await response.Content.ReadAsStringAsync();
                            ex.Data["Arg.fromLanguage"] = fromLanguage;
                            ex.Data["Arg.toLanguage"] = toLanguage;
                            ex.Data["Arg.mimeType"] = mimeType;
                            logger.LogError(ex, "Failed to translate using GoogleTranslationService.");
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
            //httpClient.DefaultRequestHeaders.Add("Authorization", configSection["ApiKey"]);
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

        public class TranslateRequest
        {
            /// <summary>
            /// The texts to translate.
            /// </summary>
            [JsonPropertyName("q")]
            public List<string> Texts { get; } = new List<string>();

            /// <summary>
            /// Language of the input texts. If null, Google will auto-detect.
            /// </summary>
            /// <seealso href="https://cloud.google.com/translate/docs/languages"/>
            [JsonPropertyName("source")]
            public string SourceLanguage { get; set; }

            /// <summary>
            /// Language to translate the texts into.
            /// </summary>
            /// <seealso href="https://cloud.google.com/translate/docs/languages"/>
            [JsonPropertyName("target")]
            public string TargetLanguage { get; set; }

            /// <summary>
            /// Input format: "text" or "html".
            /// </summary>
            [JsonPropertyName("format")]
            public string Format { get; set; }
        }

        public class TranslateResponse
        {
            [JsonPropertyName("data")]
            public TranslationData Data { get; set; }

            public class TranslationData
            {
                [JsonPropertyName("translations")]
                public TranslationDataItem[] Translations { get; set; }
            }

            public class TranslationDataItem
            {
                [JsonPropertyName("translatedText")]
                public string TranslatedText { get; set; }

                [JsonPropertyName("detectedSourceLanguage")]
                public string DetectedSourceLanguage { get; set; }
            }
        }
    }
}
