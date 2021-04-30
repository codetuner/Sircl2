using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Sircl.Website.Data.Content
{
    /// <summary>
    /// Represents the type of a property value.
    /// </summary>
    [Table(nameof(DataType), Schema = "content")]
    public class DataType
    {
        /// <summary>
        /// Identifier of the data type.
        /// </summary>
        [Key]
        public virtual int Id { get; set; }

        /// <summary>
        /// Name of the data type.
        /// </summary>
        [Required, MaxLength(200)]
        public virtual string Name { get; set; }

        /// <summary>
        /// Name of the EditorTemplate to use for editing content, and DisplayTemplate to use for rendering.
        /// </summary>
        [Required, MaxLength(200)]
        public virtual string Template { get; set; }

        /// <summary>
        /// Settings for this data type.
        /// The settings are passed to the ViewData of the EditorTemplates and DisplayTemplates.
        /// </summary>
        public virtual string Settings { get; set; }

        /// <summary>
        /// Settings in the form of a dictionary.
        /// </summary>
        [NotMapped]
        public Dictionary<string, object> SettingsDictionary
        {
            get
            {
                return JsonSerializer.Deserialize<Dictionary<string, object>>("{" + this.Settings + "}");
            }
        }
    }
}
