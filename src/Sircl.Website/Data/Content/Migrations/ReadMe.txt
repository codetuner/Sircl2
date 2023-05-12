
To create new migrations:

PM> Add-Migration <MigrationName> -Context ContentDbContext -OutputDir Data\Content\Migrations

To apply migrations:

PM> Update-Database -Context ContentDbContext

