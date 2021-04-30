
To create new migrations:

PM> Add-Migration CreateLocalizeSchema -Context LocalizeDbContext -OutputDir Data\Localize\Migrations

To apply migrations:

PM> Update-Database -Context LocalizeDbContext

