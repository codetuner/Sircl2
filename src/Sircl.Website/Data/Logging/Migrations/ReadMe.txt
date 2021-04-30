
To create new migrations:

PM> Add-Migration CreateLoggingSchema -Context LoggingDbContext -OutputDir Data\Logging\Migrations

To apply migrations:

PM> Update-Database -Context LoggingDbContext

