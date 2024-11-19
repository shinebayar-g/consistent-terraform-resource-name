# Move Terraform Resources

Features:

- Move Terraform resources between modules and autogenerate moved blocks.
- Enforce consistent naming conventions (underscores) for resources and modules.

## Usage

```sh
# Just fix the naming
❯ npx move-terraform-resources example.tf

# Move resources to a new module and fix the naming
❯ npx move-terraform-resources example.tf --module=foo
Fixed resource references:
-   service_account_id = google_service_account.some-account.account_id
+   service_account_id = google_service_account.some_account.account_id
Fixed resource references:
-   member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.something-something.name}/attribute.repository/my-github/repository-name"
+   member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.something_something.name}/attribute.repository/my-github/repository-name"
Written to file: example.underscored.tf
Written to file: example.moved.tf
```
