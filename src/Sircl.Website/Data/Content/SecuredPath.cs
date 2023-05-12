using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Data.Content
{
    /// <summary>
    /// Holds security settings for a path.
    /// </summary>
    [Table(nameof(SecuredPath), Schema = "content")]
    public class SecuredPath
    {
        /// <summary>
        /// Identifier of the secured path.
        /// </summary>
        [Key]
        public virtual int Id { get; set; }

        /// <summary>
        /// Path to be secured.
        /// </summary>
        [MaxLength(2000)]
        [Required]
        public virtual string Path { get; set; }

        /// <summary>
        /// Comma separated list of roles to limit access to this path to.
        /// </summary>
        [MaxLength(2000)]
        public virtual string Roles { get; set; }

        /// <summary>
        /// Internal notes.
        /// </summary>
        public virtual string Notes { get; set; }
    }
}
