
To create new migrations:

PM> Add-Migration CreateContentSchema -Context ContentDbContext -OutputDir Data\Content\Migrations

To apply migrations:

PM> Update-Database -Context ContentDbContext

