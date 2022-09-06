using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text.RegularExpressions;

namespace Arebis.Core.Localization
{
    public class LocalizationResourcesProvider
    {
        private volatile LocalizationResources resources;

        public virtual bool HasResources => (this.resources != null);

        public virtual void SetResources(LocalizationResources resources)
        {
            this.resources = resources;
        }

        public virtual void LoadResources(Stream stream)
        {
#pragma warning disable SYSLIB0011
            this.resources = new BinaryFormatter().Deserialize(stream) as LocalizationResources;
#pragma warning restore SYSLIB0011
        }

        public virtual void SaveResources(Stream stream)
        {
#pragma warning disable SYSLIB0011
            new BinaryFormatter().Serialize(stream, this.resources);
#pragma warning restore SYSLIB0011
        }

        public virtual string GetResourceValue(string path, string key, object[] parameters, LocalizationData data, CultureInfo culture, CultureInfo fallbackCulture, bool fallbackToParentCultures)
        {
            List<LocalizationResource> resources;
            if (this.resources.TryGetValue(key, out resources))
            {
                foreach(var resource in resources)
                {
                    if (path?.StartsWith(resource.ForPath ?? String.Empty, StringComparison.InvariantCultureIgnoreCase) ?? true)
                    {
                        return ResourceToString(resource, parameters, data, culture, fallbackCulture, fallbackToParentCultures);
                    }
                }
            }

            // If no match, return null;
            return null;
        }

        protected virtual string ResourceToString(LocalizationResource resource, object[] parameters, LocalizationData data, CultureInfo culture, CultureInfo fallbackCulture, bool fallbackToParentCultures)
        {
            // Search for value for culture:
            string value;
            while (!resource.Values.TryGetValue(culture.Name, out value))
            {
                if (fallbackToParentCultures)
                {
                    culture = culture.Parent;
                }
                else
                {
                    culture = null;
                }
                if (culture == null || culture.Name == "")
                {
                    if (fallbackCulture == null)
                    {
                        return null;
                    }
                    else if (!resource.Values.TryGetValue(fallbackCulture.Name, out value))
                    {
                        return null;
                    }
                }
            }

            // Special substitutions:
            if (resource.ExtendedSubstitutionKeys != null)
            {
                foreach (var substKey in resource.ExtendedSubstitutionKeys)
                {
                    if ("{culture:name}".Equals(substKey))
                    {
                        value = value.Replace(substKey, culture.Name);
                    }
                    else if (substKey.StartsWith("{localizer:"))
                    {
                        var name = substKey.Substring(11, substKey.Length - 12);
                        value = value.Replace(substKey, this.GetResourceValue(resource.ForPath, name, null, data, culture, fallbackCulture, fallbackToParentCultures) ?? ("[localizer:" + name + "]"));
                    }
                    else if (substKey.StartsWith("{data:") && data != null)
                    {
                        var name = substKey.Substring(6, substKey.Length - 7);
                        if (data.TryGetValue(name, out string val))
                        {
                            value = value.Replace(substKey, val);
                        }
                        else
                        { 
                            value = value.Replace(substKey, "[data:" + name + "]");
                        }
                    }
                }
            }

            // Substitute parameters:
            if (parameters != null && parameters.Length > 0)
            {
                value = String.Format(value, parameters);
            }

            // Return value:
            return value;
        }
    }
}
