using Arebis.Core.Localization;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Sircl.Website.Data.Localize
{
    /// <summary>
    /// Represents a localization key.
    /// </summary>
    [Table(nameof(Key), Schema = "localize")]
    public class Key
    {
        /// <summary>
        /// Id of the key.
        /// </summary>
        [Key]
        [JsonIgnore]
        public virtual int Id { get; set; }

        /// <summary>
        /// Domain id of the key.
        /// </summary>
        [JsonIgnore]
        public virtual int DomainId { get; set; }

        /// <summary>
        /// Domain of the key.
        /// </summary>
        [JsonIgnore]
        [ForeignKey(nameof(DomainId))]
        public virtual Domain Domain { get; set; }

        /// <summary>
        /// Name of the key.
        /// </summary>
        [Required, MaxLength(2000)]
        public virtual string Name { get; set; }

        /// <summary>
        /// MimeType of the key value. Used to distinguish plain text from HTML.
        /// </summary>
        [Required, MaxLength(200)]
        public virtual string MimeType { get; set; }

        /// <summary>
        /// Path to which this key's values are scoped.
        /// </summary>
        [MaxLength(2000)]
        public virtual string ForPath { get; set; }

        /// <summary>
        /// List of parameter names.
        /// </summary>
        [MaxLength(2000)]
        public virtual string[] ParameterNames { get; set; }

        /// <summary>
        /// Localized values for this key.
        /// </summary>
        [InverseProperty(nameof(KeyValue.Key))]
        public virtual IList<KeyValue> Values { get; set; }

        /// <summary>
        /// List of culture-names of values still to be reviewed.
        /// </summary>
        [MaxLength(2000)]
        public virtual string[] ValuesToReview { get; set; }

        /// <summary>
        /// Notes for internal use.
        /// </summary>
        public virtual string Notes { get; set; }
    }
}
