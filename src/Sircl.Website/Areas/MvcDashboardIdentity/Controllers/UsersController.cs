﻿using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Sircl.Website.Areas.MvcDashboardIdentity.Models;
using Sircl.Website.Areas.MvcDashboardIdentity.Models.Users;
using Sircl.Website.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardIdentity.Controllers
{
    public class UsersController : BaseController
    {
        #region Construction

        private readonly ApplicationDbContext context;
        private readonly UserManager<IdentityUser> userManager;

        public UsersController(IServiceProvider services, ApplicationDbContext context, UserManager<IdentityUser> userManager)
        {
            this.context = context;
            //this.userManager = (UserManager<IdentityUser>)services.GetService(typeof(UserManager<IdentityUser>));
            this.userManager = userManager;
        }

        #endregion

        #region Claim Types

        static Dictionary<string, string> ClaimTypeToName;
        static Dictionary<string, string> ClaimTypeToAlias;

        static UsersController()
        {
            var claimTypes = typeof(ClaimTypes)
                .GetFields(BindingFlags.Static | BindingFlags.Public)
                .OrderBy(f => f.Name)
                .Select(f => new string[] { "@" + f.Name, (string)f.GetValue(null) })
                .ToArray();

            ClaimTypeToName = new Dictionary<string, string>();
            ClaimTypeToAlias = new Dictionary<string, string>();
            foreach (var type in claimTypes)
            {
                ClaimTypeToName[type[0]] = type[1];
                ClaimTypeToAlias[type[1]] = type[0];
            }
        }

        static string ClaimsGet(Dictionary<string, string> claimsDict, string key)
        {
            if (claimsDict.TryGetValue(key, out string value))
            {
                return value;
            }
            else
            {
                return key;
            }
        }

        #endregion

        #region Index

        public IActionResult Index(IndexModel model)
        {
            // Retrieve data:
            var query = context.Users.AsQueryable();
            if (!String.IsNullOrWhiteSpace(model.Query))
                query = query.Where(d => d.NormalizedUserName.Contains(model.Query) || d.NormalizedEmail.Contains(model.Query));

            // Build model:
            var count = query
                .Count();
            model.MaxPage = (count + model.PageSize - 1) / model.PageSize;
            model.Items = query
                .OrderBy(model.Order ?? "UserName ASC")
                .Skip((model.Page - 1) * model.PageSize)
                .Take(model.PageSize)
                .ToArray();

            // Render view:
            return View("Index", model);
        }

        public IActionResult DownloadList(string q = null)
        {
            // Retrieve data:
            var query = context.Users.AsQueryable();
            var fullCount = query.Count();
            if (!String.IsNullOrWhiteSpace(q))
                query = query.Where(d => d.NormalizedUserName.Contains(q) || d.NormalizedEmail.Contains(q));

            // Build CSV:
            var sb = new StringBuilder();
            sb.AppendLine("UserId,UserName,Email,IsLockedOut");
            foreach (var line in query.OrderBy(u => u.UserName).Select(u => $"{u.Id},{u.UserName},{u.Email},{u.IsLockedout()}"))
                sb.AppendLine(line);
            var bytes = Encoding.UTF8.GetBytes(sb.ToString());
            return this.File(bytes, "text/csv; charset=utf-8", "Users.csv");
        }

        #endregion

        #region Edit

        [HttpGet]
        public async Task<IActionResult> New()
        {
            return await Edit("0");
        }

        [HttpGet]
        public async Task<IActionResult> Edit(string id)
        {
            // Retrieve data:
            var user = await userManager.FindByIdAsync(id);

            // Build model:
            var model = new EditModel() { Item = user };
            model.SupportsUserRoles = userManager.SupportsUserRole;
            if (model.SupportsUserRoles)
                model.UserRoleNames = context.Roles.Where(r => context.UserRoles.Where(ur => ur.UserId == id).Select(ur => ur.RoleId).Contains(r.Id)).Select(r => r.Name).ToList();
            model.SupportsUserClaims = userManager.SupportsUserClaim;
            if (model.SupportsUserClaims)
                model.UserClaims = context.UserClaims.Where(c => c.UserId == id).ToList();

            // Render view:
            return EditView(model);
        }

        [HttpPost]
        public async Task<IActionResult> Save(string id, EditModel model, bool apply = false)
        {
            //if (String.IsNullOrWhiteSpace(model.Item.UserName))
            //    ModelState.AddModelError("Item.UserName", "UserName is required.");

            IdentityResult result = null;
            if (ModelState.IsValid)
            {
                result = await this.SaveUserAsync(model.Item, model.UserRoleNames, model.UserClaims);
                if (result.Succeeded)
                {
                    Response.Headers["X-Sircl-Load"] = "#topMenu";
                    if (!apply)
                    {
                        return Back(false);
                    }
                    else
                    {
                        ModelState.Clear();
                        model.HasChanges = false;
                    }
                }
                else
                {
                    foreach (var resultError in result.Errors)
                    {
                        ModelState.AddModelError("", resultError.Description);
                    }
                }
            }

            Response.Headers.Add("X-Sircl-History-Replace", Url.Action("Edit", new { id = model.Item.Id }));
            return EditView(model);
        }

        [HttpPost]
        public IActionResult AddClaimDlgBody(EditModel model)
        {
            ModelState.Clear();
            return EditView(model, viewName: "Edit_Claims_AddClaimDlgBody");
        }

        [HttpPost]
        public IActionResult AddClaim(EditModel model)
        {
            ModelState.Clear();

            if (String.IsNullOrWhiteSpace(model.NewClaim?.ClaimType))
            {
                ModelState.AddModelError("NewClaim.ClaimType", "Value should not be empty.");
            }
            else
            {
                // Convert alias to real type name:
                model.NewClaim.ClaimType = ClaimsGet(ClaimTypeToName, model.NewClaim.ClaimType);

                // Add claim:
                model.UserClaims.Add(model.NewClaim);

                // Mark dirty:
                model.HasChanges = true;
            }

            // Return view:
            return EditView(model, viewName: "Edit_Claims");
        }

        [HttpPost]
        public IActionResult RemoveClaim(EditModel model, int claimIndex)
        {
            ModelState.Clear();

            // Remove claim:
            model.UserClaims.RemoveAt(claimIndex);

            // Mark dirty:
            model.HasChanges = true;

            // Return view:
            return EditView(model, viewName: "Edit_Claims");
        }

        [HttpPost]
        public async Task<IActionResult> Delete(EditModel model)
        {
            if (model.Item.Id == null)
            {
                return Back();
            }
            else
            {
                IdentityResult result = await userManager.DeleteAsync(model.Item);

                if (result.Succeeded)
                {
                    Response.Headers["X-Sircl-Load"] = "#topMenu";
                    return Back(false);
                }

                return EditView(model, identityResult: result);
            }
        }

        private IActionResult EditView(EditModel model, IdentityResult identityResult = null, string viewName = null)
        {
            if (identityResult != null && !identityResult.Succeeded)
            {
                foreach (var error in identityResult.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                }
            }

            model.SupportsUserRoles = userManager.SupportsUserRole;
            if (model.SupportsUserRoles)
                model.Roles = context.Roles.ToList();
            model.SupportsUserClaims = userManager.SupportsUserClaim;
            model.NewClaim = null;
            model.ClaimTypes = ClaimTypeToName.Keys.ToArray();

            return View(viewName ?? "Edit", model);
        }

        private async Task<IdentityResult> SaveUserAsync(IdentityUser user, List<string> userRoleNames, List<IdentityUserClaim<string>> userClaims)
        {
            IdentityResult result;
            IdentityUser storedUser;
            if (user.Id == null)
            {
                // Create user object:
                user.Id = Guid.NewGuid().ToString();
                result = await userManager.CreateAsync(user);
                if (!result.Succeeded) return result;

                // Retrieve stored user:
                storedUser = await userManager.FindByNameAsync(user.UserName);
            }
            else
            {
                // Update user object:
                storedUser = await userManager.FindByIdAsync(user.Id);
                storedUser.UserName = user.UserName;
                storedUser.Email = user.Email;
                storedUser.EmailConfirmed = user.EmailConfirmed;
                storedUser.PhoneNumber = user.PhoneNumber;
                storedUser.PhoneNumberConfirmed = user.PhoneNumberConfirmed;
                storedUser.LockoutEnabled = user.LockoutEnabled;
                storedUser.LockoutEnd = user.LockoutEnd;
                storedUser.TwoFactorEnabled = user.TwoFactorEnabled;
                storedUser.ConcurrencyStamp = user.ConcurrencyStamp;
                result = await userManager.UpdateAsync(storedUser);
                if (!result.Succeeded) return result;
            }

            // Update roles:
            if (userManager.SupportsUserRole)
            {
                // Remove claims without value:
                userClaims = userClaims.Where(c => !String.IsNullOrWhiteSpace(c.ClaimValue)).ToList();
                // Synchronise with stored claims:
                var storedUserRoleNames = context.Roles.Where(r => context.UserRoles.Where(ur => ur.UserId == storedUser.Id).Select(ur => ur.RoleId).Contains(r.Id)).Select(r => r.Name).ToList();
                var roleNamesToKeep = new List<string>();
                foreach (var name in userRoleNames)
                {
                    if (storedUserRoleNames.Contains(name))
                    {
                        roleNamesToKeep.Add(name);
                    }
                    else
                    {
                        result = await userManager.AddToRoleAsync(storedUser, name);
                        if (!result.Succeeded) return result;
                    }
                }
                foreach (var name in storedUserRoleNames.Except(roleNamesToKeep))
                {
                    result = await userManager.RemoveFromRoleAsync(storedUser, name);
                    if (!result.Succeeded) return result;
                }
            }

            // Update claims:
            if (userManager.SupportsUserClaim)
            {
                var storedClaims = context.UserClaims.Where(c => c.UserId == storedUser.Id).ToList();
                foreach (var sameclaim in storedClaims.Where(c => userClaims.Select(cs => cs.Id).Contains(c.Id)))
                {
                    var updatedclaim = userClaims.Single(c => c.Id == sameclaim.Id);
                    if (updatedclaim.ClaimValue != sameclaim.ClaimValue)
                    {
                        result = await userManager.RemoveClaimAsync(storedUser, new Claim(sameclaim.ClaimType, sameclaim.ClaimValue));
                        if (!result.Succeeded) return result;
                        result = await userManager.AddClaimAsync(storedUser, new Claim(updatedclaim.ClaimType, updatedclaim.ClaimValue));
                        if (!result.Succeeded) return result;
                    }
                }
                foreach (var oldclaim in storedClaims.Where(c => !userClaims.Select(cs => cs.Id).Contains(c.Id)))
                {
                    result = await userManager.RemoveClaimAsync(storedUser, new Claim(oldclaim.ClaimType, oldclaim.ClaimValue));
                    if (!result.Succeeded) return result;
                }
                foreach (var newclaim in userClaims.Where(c => !storedClaims.Select(cs => cs.Id).Contains(c.Id)))
                {
                    result = await userManager.AddClaimAsync(storedUser, new Claim(newclaim.ClaimType, newclaim.ClaimValue));
                    if (!result.Succeeded) return result;
                }
            }

            // Return success state:
            return result;
        }

        #endregion
    }
}
