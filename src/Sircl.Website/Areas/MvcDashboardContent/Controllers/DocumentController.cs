using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Sircl.Website.Areas.MvcDashboardContent.Models.Document;
using Sircl.Website.Data;
using Sircl.Website.Data.Content;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardContent.Controllers
{
    [Authorize(Roles = "Administrator,ContentAdministrator,ContentEditor,ContentAuthor")]
    public class DocumentController : BaseController
    {
        #region Construction

        private readonly ContentDbContext context;
        private readonly IOptions<RequestLocalizationOptions> localizationOptions;

        public DocumentController(ContentDbContext context, IOptions<RequestLocalizationOptions> localizationOptions)
        {
            this.context = context;
            this.localizationOptions = localizationOptions;
        }

        #endregion

        #region Index

        [HttpGet]
        public IActionResult Index(IndexModel model)
        {
            var count = context.ContentDocuments
                .Where(d => d.Name.Contains(model.Query ?? "") || d.Path.Contains(model.Query ?? ""))
                .Where(d => d.TypeId == model.DocumentTypeId || model.DocumentTypeId == null)
                .Where(d => d.DeletedOnUtc == null)
                .Where(d => d.State == model.State || model.State == null)
                .Count();
            model.MaxPage = (count + model.PageSize - 1) / model.PageSize;
            model.Items = context.ContentDocuments
                .Include(d => d.Type)
                .Where(d => d.Name.Contains(model.Query ?? "") || d.Path.Contains(model.Query ?? ""))
                .Where(d => d.TypeId == model.DocumentTypeId || model.DocumentTypeId == null)
                .Where(d => d.DeletedOnUtc == null)
                .Where(d => d.State == model.State || model.State == null)
                .OrderBy(model.Order ?? "Name ASC")
                .Skip((model.Page - 1) * model.PageSize)
                .Take(model.PageSize)
                .ToArray();
            model.DocumentTypes = context.ContentDocumentTypes
                .Where(dt => dt.IsInstantiable)
                .OrderBy(dt => dt.Name)
                .Select(dt => new SelectListItem() { Value = dt.Id.ToString(), Text = dt.Name, Selected = (model.DocumentTypeId == dt.Id) })
                .ToList();
            model.States = Document.States
                .Where(s => s != "Deleted")
                .Select(st => new SelectListItem() { Value = st, Text = st, Selected = (model.State == st) })
                .ToList();
            model.CanCreate = this.CanCreate();

            return View("Index", model);
        }

        [HttpGet]
        public IActionResult NewModal()
        {
            var model = new NewModel();
            model.DocumentTypes = context.ContentDocumentTypes.Where(dt => dt.IsInstantiable).OrderBy(dt => dt.Name).ToList();

            return View("NewModal", model);
        }

        [HttpPost]
        [Authorize(Roles = "Administrator,ContentAdministrator,ContentAuthor")]
        public IActionResult IndexRequestPublication(IndexModel model, int[] selection)
        {
            context.ContentDocuments
                .Where(d => selection.Contains(d.Id))
                .ToList()
                .ForEach(d => d.TryRequestPublication(this.HttpContext.User?.Identity?.Name));
            context.SaveChanges();

            return Index(model);
        }

        [HttpPost]
        [Authorize(Roles = "Administrator,ContentAdministrator,ContentEditor")]
        public IActionResult IndexPublish(IndexModel model, int[] selection)
        {
            context.ContentDocuments
                .Where(d => selection.Contains(d.Id))
                .ToList()
                .ForEach(d => d.TryPublish(this.HttpContext.User?.Identity?.Name));
            context.SaveChanges();

            return Index(model);
        }

        [HttpPost]
        [Authorize(Roles = "Administrator,ContentAdministrator,ContentEditor")]
        public IActionResult IndexUnpublish(IndexModel model, int[] selection)
        {
            context.ContentDocuments
                .Where(d => selection.Contains(d.Id))
                .ToList()
                .ForEach(d => d.TryUnpublish(this.HttpContext.User?.Identity?.Name));
            context.SaveChanges();

            return Index(model);
        }

        [HttpPost]
        [Authorize(Roles = "Administrator,ContentAdministrator,ContentEditor,ContentAuthor")]
        public IActionResult IndexDelete(IndexModel model, int[] selection)
        {
            var documents = context.ContentDocuments
                .Where(d => selection.Contains(d.Id))
                .ToList();

            // Limit by user role:
            if (!User.IsInRole("ConentAuthor"))
                documents.RemoveAll(d => d.State == "Published");
            if (!User.IsInRole("ConentEditor"))
                documents.RemoveAll(d => d.State == "New");

            context.RemoveRange(documents);
            context.SaveChanges();

            return Index(model);
        }

        #endregion

        #region Edit

        [HttpGet]
        public IActionResult New(int typeId)
        {
            if (!CanCreate()) return Forbid();

            var model = new EditModel();
            model.Item = new Data.Content.Document()
            {
                TypeId = typeId,
            };

            return EditView(model);
        }

        [HttpGet]
        public IActionResult Edit(int id)
        {
            if (!CanEdit(id)) return ForwardToAction(nameof(Display), null, new { id = id });

            var model = new EditModel();
            model.Item = context.ContentDocuments
                .Include(d => d.Properties)
                .SingleOrDefault(d => d.Id == id);
            if (model.Item == null) return new NotFoundResult();
            
            model.ItemState = model.Item.State;

            return EditView(model);
        }

        [HttpPost]
        public IActionResult Submit(int id, EditModel model)
        {
            ModelState.Clear();
            model.HasChanges = true;
            return EditView(model);
        }

        [HttpPost]
        public IActionResult Save(int id, EditModel model, bool apply = false, bool andcopy = false)
        {
            if (!CanEdit(model.Item.Id)) return Forbid();

            if (ModelState.IsValid)
            {
                try
                {
                    // Update document:
                    var entry = context.Update(model.Item);
                    var utcNow = DateTime.UtcNow;
                    if (entry.State == EntityState.Added)
                    {
                        // Set created fields:
                        model.Item.CreatedOnUtc = utcNow;
                        model.Item.CreatedBy = this.HttpContext.User?.Identity?.Name;
                    }
                    else
                    {
                        // Update modified fields but not other unmapped fields:
                        model.Item.ModifiedOnUtc = utcNow;
                        model.Item.ModifiedBy = this.HttpContext.User?.Identity?.Name;
                        entry.Property(nameof(Document.CreatedOnUtc)).IsModified = false;
                        entry.Property(nameof(Document.CreatedBy)).IsModified = false;
                        entry.Property(nameof(Document.PublicationRequestedOnUtc)).IsModified = false;
                        entry.Property(nameof(Document.PublicationRequestedBy)).IsModified = false;
                        entry.Property(nameof(Document.PublishedOnUtc)).IsModified = false;
                        entry.Property(nameof(Document.PublishedBy)).IsModified = false;
                        entry.Property(nameof(Document.DeletedOnUtc)).IsModified = false;
                        entry.Property(nameof(Document.DeletedBy)).IsModified = false;

                        if (model.RequestPublication && (User.IsInRole("Administrator") || User.IsInRole("ContentAdministrator") || User.IsInRole("ContentAuthor")))
                        {
                            model.Item.PublicationRequestedOnUtc = utcNow;
                            model.Item.PublicationRequestedBy = this.HttpContext.User?.Identity?.Name;
                        }
                        else if (model.Publish && (User.IsInRole("Administrator") || User.IsInRole("ContentAdministrator") || User.IsInRole("ContentEditor")))
                        {
                            model.Item.PublishedOnUtc = utcNow;
                            model.Item.PublishedBy = this.HttpContext.User?.Identity?.Name;
                        }
                        else if (model.Unpublish && (User.IsInRole("Administrator") || User.IsInRole("ContentAdministrator") || User.IsInRole("ContentEditor")))
                        {
                            entry.Property(nameof(Document.PublicationRequestedOnUtc)).IsModified = true;
                            entry.Property(nameof(Document.PublicationRequestedBy)).IsModified = true;
                            entry.Property(nameof(Document.PublishedOnUtc)).IsModified = true;
                            entry.Property(nameof(Document.PublishedBy)).IsModified = true;
                        }

                        // Delete properties on model not on model anymore:
                        var propertyIds = model.Item.Properties.Select(p => p.Id).ToList();
                        foreach (var dbproperty in context.ContentProperties.Where(cp => cp.DocumentId == model.Item.Id).ToList())
                        {
                            if (!propertyIds.Contains(dbproperty.Id)) context.Remove(dbproperty);
                        }
                    }

                    // Save changes:
                    context.SaveChanges();

                    // Return answer:
                    if (apply)
                    {
                        ModelState.Clear();
                        model.HasChanges = false;
                        Response.Headers.Add("X-Sircl-History-Replace", Url.Action("Edit", new { id = model.Item.Id }));
                    }
                    else if (andcopy)
                    {
                        ModelState.Clear();
                        model.HasChanges = true;
                        model.Item.Id = 0;
                        model.Item.Properties.ForEach(p => p.Id = 0);
                        Response.Headers.Add("X-Sircl-History-Replace", Url.Action("New"));
                    }
                    else
                    {
                        return Back(false);
                    }
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", "An unexpected error occured.");
                    ViewBag.Exception = ex;
                }
            }

            return EditView(model);
        }

        [HttpPost]
        public IActionResult SavePropertyValue(int id, int propertyId, string value)
        {
            if (!CanEdit(id)) return Forbid();

            var property = context.ContentProperties.Find(propertyId);
            if (property != null && value != null)
            {
                property.Value = value;

                var document = context.ContentDocuments.Find(property.DocumentId);
                document.ModifiedOnUtc = DateTime.UtcNow;
                document.ModifiedBy = this.HttpContext.User?.Identity?.Name;

                context.SaveChanges();

                return Ok();
            }
            else
            {
                return this.NoContent();
            }
        }

        [HttpPost]
        public IActionResult Delete(int id, EditModel model)
        {
            if (!CanEdit(id)) return Forbid();

            try
            {
                var item = context.ContentDocuments.Find(id);
                item.DeletedOnUtc = DateTime.UtcNow;
                item.DeletedBy = this.HttpContext.User?.Identity?.Name;
                context.SaveChanges();
                return Back(false);
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", "An unexpected error occured.");
                ViewBag.Exception = ex;
            }

            return EditView(model);
        }

        private IActionResult EditView(EditModel model)
        {
            model.AllDocumentTypes = context.ContentDocumentTypes
                .Include(dt => dt.OwnPropertyTypes).ThenInclude(pt => pt.DataType)
                .OrderBy(t => t.Name).ToArray();
            model.AllDocumentTypesDict = model.AllDocumentTypes.ToDictionary(dt => dt.Id, dt => dt);
            model.DocumentType = model.AllDocumentTypesDict[model.Item.TypeId];
            model.SupportedUICultures = this.localizationOptions.Value.SupportedUICultures;
            model.PathsList = context.ContentDocuments.Select(d => d.Path).Distinct().OrderBy(p => p).ToList();
            return View("Edit", model);
        }

        #endregion

        #region Display

        [HttpGet]
        public IActionResult Display(int id)
        {
            var model = new DisplayModel();
            model.AllDocumentTypes = context.ContentDocumentTypes
                .Include(dt => dt.OwnPropertyTypes).ThenInclude(pt => pt.DataType)
                .OrderBy(t => t.Name).ToArray();
            model.AllDocumentTypesDict = model.AllDocumentTypes.ToDictionary(dt => dt.Id, dt => dt);
            model.Item = context.ContentDocuments
                .Include(d => d.Type)
                .Include(d => d.Properties).ThenInclude(p => p.Type).ThenInclude(t => t.DataType)
                .SingleOrDefault(d => d.Id == id);

            return View("Display", model);
        }

        #endregion

        #region Security

        private bool CanCreate()
        {
            return User.IsInRole("Administrator") || User.IsInRole("ContentAdministrator") || User.IsInRole("ContentAuthor");
        }

        private bool CanEdit(int documentId)
        {
            if (User.IsInRole("Administrator") || User.IsInRole("ContentAdministrator"))
            {
                return true;
            }
            else if (documentId == 0)
            {
                return User.IsInRole("ContentAuthor");
            }
            else
            {
                var state = context.ContentDocuments.Where(d => d.Id == documentId).Select(d => d.State).SingleOrDefault();
                if (User.IsInRole("ContentAuthor") && state == "New")
                {
                    return true;
                }
                else if (User.IsInRole("ContentEditor") && (state == "To publish" || state == "Published"))
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }

        #endregion
    }
}
