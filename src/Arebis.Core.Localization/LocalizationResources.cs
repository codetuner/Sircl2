using System;
using System.Linq;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using System.Runtime.Serialization;

namespace Arebis.Core.Localization
{
    /// <summary>
    /// Resources per key, ordered by path, longest first.
    /// </summary>
    [Serializable]
    public class LocalizationResources : Dictionary<string, List<LocalizationResource>>
    {
        public LocalizationResources()
        { }

        protected LocalizationResources(SerializationInfo info, StreamingContext context)
            : base(info, context)
        { }

        /// <summary>
        /// Adds a LocalizationResource.
        /// </summary>
        public void AddResource(string key, LocalizationResource resource)
        {
            if (this.TryGetValue(key, out var resourceList))
            {
                resourceList.RemoveAll(r => r.ForPath == resource.ForPath);
                resourceList.Add(resource);
            }
            else
            {
                this[key] = resourceList = new List<LocalizationResource>();
                resourceList.Add(resource);
            }
        }

        /// <summary>
        /// Adds a value to a simple resource with no path and default settings.
        /// </summary>
        public void AddResourceValue(string key, string culture, string value)
        {
            if (this.TryGetValue(key, out var resourceList))
            {
                var resource = resourceList.FirstOrDefault(r => String.IsNullOrEmpty(r.ForPath));
                if (resource == null)
                {
                    resource = new LocalizationResource();
                    resourceList.Add(resource);
                }
                resource.Values[culture] = value;
            }
            else
            {
                resourceList = new List<LocalizationResource>();
                var resource = new LocalizationResource();
                resource.Values[culture] = value;
                resourceList.Add(resource);
                this[key] = resourceList;
            }
        }

        private Regex extendedSubstitutionRegex = new Regex("\\{[a-zA-Z][^}]*\\}");

        public void Compile()
        {
            var keysToRemove = new List<string>();
            foreach (var pair in this)
            {
                if ((pair.Value == null) || (pair.Value.Count == 0))
                {
                    // Empty keys are to be removed:
                    keysToRemove.Add((pair.Key));
                }
                else if (pair.Value.Count > 0)
                {
                    // Sort values by length of path (longest first):
                    pair.Value.Sort();

                    // Determine substitution keys:
                    foreach (var resource in pair.Value)
                    {
                        var extendedSubstitutionKeys = new HashSet<string>();
                        foreach (var value in resource.Values.Values)
                        {
                            foreach (Match match in extendedSubstitutionRegex.Matches(value))
                            {
                                extendedSubstitutionKeys.Add(match.Value);
                            }
                        }

                        if (extendedSubstitutionKeys.Count > 0)
                        {
                            resource.ExtendedSubstitutionKeys = extendedSubstitutionKeys.ToList();
                        }
                        else
                        {
                            resource.ExtendedSubstitutionKeys = null;
                        }
                    }
                }
            }

            foreach (var keyToRemove in keysToRemove)
            {
                this.Remove(keyToRemove);
            }
        }
    }
}
