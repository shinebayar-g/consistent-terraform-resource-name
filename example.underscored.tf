module "gke_cluster" {
  source = "github.com/terraform-google-modules/terraform-google-kubernetes-engine//modules/cluster"
}

resource "google_service_account" "some_account" {
  account_id = "some-account"
  project    = "foo"
}

resource "google_service_account_iam_member" "sa_member" {
  service_account_id = google_service_account.some_account.account_id
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.something_something.name}/attribute.repository/my-github/repository-name"
}
