using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Sircl.Website.Areas.MvcDashboardIdentity.Models;
using Sircl.Website.Areas.MvcDashboardIdentity.Models.Roles;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardIdentity.Controllers
{
    public class RolesController : BaseController
    {
        #region Construction

        private readonly RoleManager<IdentityRole> roleManager;

        public RolesController(IServiceProvider services, RoleManager<IdentityRole> roleManager)
        {
            this.roleManager = roleManager;
        }

        #endregion

        #region Index

        public IActionResult Index(IndexModel model)
        {
            // Retrieve data:
            var query = roleManager.Roles.AsQueryable();
            if (!String.IsNullOrWhiteSpace(model.Query))
                query = query
                    .Where(d => d.NormalizedName.Contains(model.Query));

            // Build model:
            var count = query
                .Count();
            model.MaxPage = (count + model.PageSize - 1) / model.PageSize;
            model.Items = query
                .OrderBy(model.Order ?? "NormalizedName ASC")
                .Skip((model.Page - 1) * model.PageSize)
                .Take(model.PageSize)
                .ToArray();

            // Render view:
            return View("Index", model);
        }

        public IActionResult Download()
        {
            var sb = new StringBuilder();
            sb.AppendLine("RoleId,RoleName");
            var query = roleManager.Roles.AsQueryable();
            foreach (var line in query.OrderBy(r => r.Name).Select(r => $"{r.Id},{r.Name}"))
                sb.AppendLine(line);
            var bytes = Encoding.UTF8.GetBytes(sb.ToString());
            return this.File(bytes, "text/csv", "Roles.csv");
        }

        #endregion

        #region Edit

        [HttpGet]
        public async Task<IActionResult> New()
        {
            return await Edit("0");
        }

        [HttpGet]
        public async Task<IActionResult> Edit(string id = "0")
        {
            // Retrieve data:
            var role = await roleManager.FindByIdAsync(id);

            // Build model:
            var model = new EditModel() { Item = role };

            // Render view:
            return EditView(model, null);
        }

        [HttpPost]
        public async Task<IActionResult> Save(EditModel model)
        {
            IdentityResult result = null;
            if (this.ModelState.IsValid)
            {
                result = await this.SaveRoleAsync(model.Item);

                if (result == null || result.Succeeded)
                {
                    Response.Headers["X-Sircl-Load"] = "#topMenu";
                    return DialogOk();
                }
            }

            return EditView(model, result);
        }

        [HttpGet]
        public async Task<IActionResult> DeleteRequest(string id)
        {
            var role = await roleManager.FindByIdAsync(id);
            return View("DeleteRequest", new DeleteRequestModel() { Item = role });
        }

        [HttpPost]
        public async Task<IActionResult> Delete(EditModel model)
        {
            if (model.Item.Id == null)
            {
                return DialogClose();
            }
            else
            {
                IdentityResult result = await roleManager.DeleteAsync(model.Item);

                if (result.Succeeded)
                {
                    Response.Headers["X-Sircl-Load"] = "#topMenu";
                    return DialogOk();
                }

                return EditView(model, result);
            }
        }

        private IActionResult EditView(EditModel model, IdentityResult identityResult)
        {
            if (identityResult != null && !identityResult.Succeeded)
            {
                foreach (var error in identityResult.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }
            }

            return View("Edit", model);
        }

        private async Task<IdentityResult> SaveRoleAsync(IdentityRole role)
        {
            if (role.Id == null)
            {
                role.Id = Guid.NewGuid().ToString();
                return await roleManager.CreateAsync(role);
            }
            else
            {
                var storedRole = await roleManager.FindByIdAsync(role.Id);
                if (storedRole.Name == role.Name) return null;

                storedRole.Name = role.Name;
                storedRole.ConcurrencyStamp = role.ConcurrencyStamp;
                return await roleManager.UpdateAsync(storedRole);
            }
        }

        #endregion
    }
}
