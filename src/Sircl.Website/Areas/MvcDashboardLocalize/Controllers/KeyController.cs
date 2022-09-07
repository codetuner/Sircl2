using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Sircl.Website.Areas.MvcDashboardLocalize.Models.Key;
using Sircl.Website.Data.Localize;
using Sircl.Website.Localize;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardLocalize.Controllers
{
    [Authorize(Roles = "Administrator,LocalizeAdministrator")]
    public class KeyController : BaseController
    {
        #region Construction

        private readonly LocalizeDbContext context;
        private readonly ILogger logger;
        private readonly ITranslationService translationService;

        public KeyController(LocalizeDbContext context, ILogger<KeyController> logger, ITranslationService translationService = null)
        {
            this.context = context;
            this.logger = logger;
            this.translationService = translationService;
        }

        #endregion

        #region Index

        [HttpGet]
        public IActionResult Index(IndexModel model)
        {
            var noQuery = String.IsNullOrWhiteSpace(model.Query);
            var count = context.LocalizeKeys
                .Where(i => i.DomainId == model.DomainId || model.DomainId == null)
                .Where(i => noQuery || i.Name.Contains(model.Query ?? "") || i.Values.Any(v => v.Value.Contains(model.Query ?? "")))
                .Count();
            model.MaxPage = (count + model.PageSize - 1) / model.PageSize;
            model.Items = context.LocalizeKeys
                .Include(i => i.Domain)
                .Where(i => i.DomainId == model.DomainId || model.DomainId == null)
                .Where(i => noQuery || i.Name.Contains(model.Query ?? "") || i.Values.Any(v => v.Value.Contains(model.Query ?? "")))
                .OrderBy(model.Order ?? "Name ASC")
                .Skip((model.Page - 1) * model.PageSize)
                .Take(model.PageSize)
                .ToArray();
            model.Domains = context.LocalizeDomains
                .OrderBy(d => d.Name)
                .Select(d => new SelectListItem() { Value = d.Id.ToString(), Text = d.Name, Selected = (model.DomainId == d.Id) })
                .ToList();

            return View("Index", model);
        }

        #endregion

        #region Edit

        [HttpGet]
        public IActionResult New(int? domainId)
        {
            var model = new EditModel();
            model.Item = new Data.Localize.Key() { DomainId = domainId ?? 0 };
            return EditView(model);
        }

        [HttpGet]
        public IActionResult Edit(int id)
        {
            var model = new EditModel();
            model.Item = context.LocalizeKeys
                .Include(k => k.Domain)
                .Include(k => k.Values)
                .SingleOrDefault(k => k.Id == id);
            if (model.Item == null) return new NotFoundResult();
            model.ParameterNames = String.Join(", ", model.Item.ParameterNames ?? Array.Empty<string>());
            model.Values = model.Item.Values.ToList();

            return EditView(model);
        }

        [HttpPost]
        public IActionResult Preview(int id, EditModel model, string previewCulture)
        {
            return Content(model.Values.Single(v => v.Culture == previewCulture).Value, MediaTypeNames.Text.Html);
        }

        [HttpPost]
        public async Task<IActionResult> AutoTranslate(int id, EditModel model)
        {
            // Check MimeType (Plain text or Html) is given:
            if (String.IsNullOrEmpty(model.Item.MimeType))
            {
                SetToastrMessage("error", "Select content type then retry.");
                return EditView(model);
            }

            ModelState.Clear();

            var succeededTranslations = new List<string>();
            var failedTranslations = new List<string>();
            var source = model.Values.Single(v => v.Culture == model.SourceCulture);
            if (!String.IsNullOrWhiteSpace(source.Value))
            {
                // Mark source as reviewed (as it is sufficiently trusted to base translations on):
                source.Reviewed = true;

                // Translate each culture that is not empty and not reviewed:
                foreach (var target in model.Values.Where(v => v.Culture != model.SourceCulture && v.Reviewed == false && String.IsNullOrWhiteSpace(v.Value)))
                {
                    try
                    {
                        var result = await translationService.TranslateAsync(source.Culture, target.Culture, model.Item.MimeType, new String[] { source.Value });
                        target.Value = result.FirstOrDefault();
                        model.HasChanges = true;
                        succeededTranslations.Add(target.Culture);
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "Autotranslating key {0} from {1} to {2} failed.", id, source.Culture, target.Culture);
                        failedTranslations.Add(target.Culture);
                    }
                }
            }

            if (failedTranslations.Any())
            {
                SetToastrMessage($"warning", $"Key translated with errors for {(String.Join(", ", failedTranslations))}.");
            }
            else if (succeededTranslations.Any())
            {
                SetToastrMessage("success", $"Key successfully translated in {(String.Join(", ", succeededTranslations))}.");
            }
            else
            {
                SetToastrMessage("info", "Nothing to translate.");
            }

            return EditView(model);
        }

        [HttpPost]
        public IActionResult Submit(int id, EditModel model)
        {
            ModelState.Clear();
            model.HasChanges = true;

            // Handle update of Domain, resulting in new list of cultures!

            return EditView(model);
        }

        [HttpPost]
        public IActionResult Save(int id, EditModel model, bool apply = false)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    if (model.SaveAsCopy)
                    {
                        model.Item.Id = 0;
                        foreach (var v in model.Values) v.Id = 0;
                    }

                    var domain = context.LocalizeDomains.Find(model.Item.DomainId);

                    model.Item.ParameterNames = String.IsNullOrWhiteSpace(model.ParameterNames)
                        ? null
                        : model.ParameterNames.Split(',').Select(s => s.Trim()).Where(s => s.Length > 0).ToArray();
                    model.Item.Values = model.Values.Where(v => v.Reviewed || v.Value != null).ToList();
                    foreach (var value in model.Values.Where(v => !v.Reviewed && v.Value == null && v.Id != default(int))) context.Remove(value);
                    model.Item.ValuesToReview = domain.Cultures.Except(model.Item.Values.Where(v => v.Reviewed).Select(v => v.Culture)).ToArray();
                    context.Update(model.Item);
                    context.SaveChanges();
                    if (!apply)
                    {
                        return Back(false);
                    }
                    else
                    {
                        ModelState.Clear();
                        model.HasChanges = false;
                        model.SaveAsCopy = false;
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Unexpected error saving key {0}", id);
                    ModelState.AddModelError("", "An unexpected error occured.");
                    ViewBag.Exception = ex;
                }
            }
            else
            {
                SetToastrMessage("error", "Failed to save the query.<br/>See validation messages for more information.");
            }

            Response.Headers.Add("X-Sircl-History-Replace", Url.Action("Edit", new { id = model.Item.Id }));
            return EditView(model);
        }

        [HttpPost]
        public IActionResult Delete(int id, EditModel model)
        {
            try
            {
                var item = context.LocalizeKeys.Find(id);
                context.Remove(item);
                context.SaveChanges();
                return Back(false);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error deleting key {0}", id);
                ModelState.AddModelError("", "An unexpected error occured.");
                ViewBag.Exception = ex;
            }

            return EditView(model);
        }

        private IActionResult EditView(EditModel model)
        {
            model.HasTranslationService = (this.translationService != null);

            model.Domains = context.LocalizeDomains.OrderBy(d => d.Name).ToArray();

            var domain = model.Domains.SingleOrDefault(d => d.Id == model.Item.DomainId);
            if (domain != null)
            {
                var values = model.Values.ToList();
                model.Values.Clear();
                foreach (var c in domain.Cultures)
                {
                    model.Values.Add(values.SingleOrDefault(v => v.Culture == c) ?? new KeyValue() { Culture = c });
                }
                foreach (var value in values)
                {
                    if (!model.Values.Contains(value) && (value.Reviewed || value.Value != null)) model.Values.Add(value);
                }
            }

            return View("Edit", model);
        }

        #endregion
    }
}
