using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Sircl.Website.Localize
{
    /// <summary>
    /// Describes a service to provide translation services.
    /// </summary>
    public interface ITranslationService
    {
        /// <summary>
        /// Requests to translate one or more texts from one language to another language.
        /// </summary>
        /// <param name="fromLanguage">Culture code of the source language. I.e. "en" or "en-US".</param>
        /// <param name="toLanguage">Culture code of the target language. I.e. "fr" or "fr-CA".</param>
        /// <param name="mimeType">Mimetype of the source text, i.e. "text/plain" or "text/html".</param>
        /// <param name="sources">The texts to be translated.</param>
        /// <param name="ct">(Optional) A CancellationToken.</param>
        /// <returns>Translated texts in the same order as the given texts. Null if the translation operation is not supported or was cancelled.</returns>
        Task<IEnumerable<string>> TranslateAsync(string fromLanguage, string toLanguage, string mimeType, IEnumerable<string> sources, CancellationToken? ct = null);
    }
}
