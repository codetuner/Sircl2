using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Controllers
{
    public abstract class BaseController : Controller
    {
        /// <summary>
        /// Returns the URL where to return to, taking the Referer into account.
        /// </summary>
        /// <param name="url">Url to return if no other option was found.</param>
        /// <returns>The "ReturnUrl" query parameter, the "Referer" header, or the given url depending on which is first found.</returns>
        public string RefererOr(string url)
        {
            return GetReturnUrl(url, true);
        }

        /// <summary>
        /// Returns the URL where to return to, taking the Referer into account.
        /// </summary>
        /// <returns>The "ReturnUrl" query parameter, the "Referer" header, or the url for the given action depending on which is first found.</returns>
        public string RefererOrAction(string action, string controller = null, object values = null, string protocol = null)
        {
            return GetReturnUrl(Url.Action(action, controller, values, protocol), true);
        }

        /// <summary>
        /// Returns the URL where to return to. Either an explicit ReturnUrl parameter, or the given url.
        /// </summary>
        /// <param name="url">Url to return if no other option was found.</param>
        /// <returns>The "ReturnUrl" query parameter or the given url depending on which is first found.</returns>
        public string ReturnUrlOr(string url)
        {
            return GetReturnUrl(url, false);
        }

        /// <summary>
        /// Returns the URL where to return to. Either an explicit ReturnUrl parameter, or the url for the given action.
        /// </summary>
        /// <param name="url">Url to return if no other option was found.</param>
        /// <returns>The "ReturnUrl" query parameter or the url for the given action depending on which is first found.</returns>
        public string ReturnUrlOrAction(string action, string controller = null, object values = null, string protocol = null)
        {
            return GetReturnUrl(Url.Action(action, controller, values, protocol), false);
        }

        private string GetReturnUrl(string defaultReturnUrl, bool overrideReferer = false)
        {
            if (Request.Query["ReturnUrl"].Count > 0)
                return Request.Query["ReturnUrl"][0];

            if (overrideReferer && Request.Headers["Referer"].Count > 0)
                return Request.Headers["Referer"][0];

            return defaultReturnUrl;
        }

        [NonAction]
        protected IActionResult Acknowledge(string location = null)
        {
            if (location != null) this.Response.Headers["Location"] = location;
            return StatusCode(202);
        }

        protected IActionResult Back(bool allowCaching = true)
        {
            Response.Headers["X-Sircl-History"] = (allowCaching) ? "back" : "back-uncached";
            return this.StatusCode(204);
        }
    }
}
