using System;
using System.Collections.Generic;
using System.Text;

namespace Arebis.Core.Localization
{
    /// <summary>
    /// A localization resource with the values in various cultures.
    /// </summary>
    [Serializable]
    public class LocalizationResource : IComparable<LocalizationResource>
    {
        /// <summary>
        /// Path for which this resource applies.
        /// </summary>
        public string ForPath { get; set; }

        /// <summary>
        /// Resource values per culture name.
        /// </summary>
        public Dictionary<string, string> Values { get; set; } = new Dictionary<string, string>();

        /// <summary>
        /// Keys to be substituted with data or other values.
        /// </summary>
        public List<string> ExtendedSubstitutionKeys { get; set; }

        /// <summary>
        /// Comparer to order resources by length of path, longest first.
        /// </summary>
        int IComparable<LocalizationResource>.CompareTo(LocalizationResource other)
        {
            var thisPathLength = this.ForPath?.Length ?? 0;
            var otherPathLength = other.ForPath?.Length ?? 0;
            return (otherPathLength - thisPathLength);
        }
    }
}
