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
    /// Represents a localized value for a localization key.
    /// </summary>
    [Table(nameof(KeyValue), Schema = "localize")]
    public class KeyValue
    {
        /// <summary>
        /// Id of the value.
        /// </summary>
        [Key]
        [JsonIgnore]
        public virtual int Id { get; set; }

        /// <summary>
        /// Key id of the value.
        /// </summary>
        [JsonIgnore]
        public virtual int KeyId { get; set; }

        /// <summary>
        /// Key of the value.
        /// </summary>
        [ForeignKey(nameof(KeyId))]
        [JsonIgnore]
        public virtual Key Key { get; set; }

        /// <summary>
        /// Culture of this value.
        /// </summary>
        [Required, MaxLength(200)]
        public virtual string Culture { get; set; }

        /// <summary>
        /// Localized value string.
        /// </summary>
        public virtual string Value { get; set; }

        /// <summary>
        /// Whether this value is reviewed.
        /// </summary>
        public virtual bool Reviewed { get; set; }
    }
}
