using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sircl.Website.Data.Content
{
    /// <summary>
    /// Defines a path redirection.
    /// </summary>
    [Table(nameof(PathRedirection), Schema = "content")]
    public class PathRedirection
    {
        /// <summary>
        /// Identifier of the path redirection.
        /// </summary>
        [Key]
        public virtual int Id { get; set; }

        /// <summary>
        /// The order in which to display/evaluate the redirection rules.
        /// </summary>
        public virtual int Position { get; set; }

        /// <summary>
        /// The path to redirect.
        /// Can be a regular expression.
        /// </summary>
        [MaxLength(2000)]
        [Required]
        public virtual string FromPath { get; set; }

        /// <summary>
        /// The path to redirect to.
        /// Can contain backreferences if the FromPath is a regular expression.
        /// </summary>
        [MaxLength(2000)]
        [Required]
        public virtual string ToPath { get; set; }

        /// <summary>
        /// The HTTP status code to return for the redirection response.
        /// </summary>
        public virtual int StatusCode { get; set; } = 302;

        /// <summary>
        /// Whether the FromPath is a regular expression, in which case the ToPath can contain backreferences.
        /// If false, the FromPath and ToPath are an exact (case insensitive) match.
        /// </summary>
        public virtual bool IsRegex { get; set; }

        /// <summary>
        /// Internal notes.
        /// </summary>
        public virtual string Notes { get; set; }
    }
}
