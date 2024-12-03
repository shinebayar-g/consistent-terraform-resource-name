module "gke-cluster" {
  source = "github.com/terraform-google-modules/terraform-google-kubernetes-engine//modules/cluster"
}

resource "google_service_account" "some-account" {
  account_id = "some-account"
  project    = "foo"
}

resource "google_service_account_iam_member" "sa-member" {
  service_account_id = google_service_account.some-account.account_id
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.something-something.name}/attribute.repository/my-github/repository-name"
}

#resource "google_pubsub_topic" "foo" {
#  name = "foo"
#  labels = {
#    foo = "bar"
#  }
#}

# resource "google_pubsub_topic" "foo" {
#  name = "foo"
#  labels = {
#    foo = "bar"
#  }
# }

variable "project_id" {
  type    = string
  default = "foo-bar"

}

resource "google_service_account_iam_member" "some-workloadIdentityUser" {
  service_account_id = google_service_account.some.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:foo.svc.id.goog[kube-system/bar]"
}

# ------------------------------------------------------------------ #
# ---- START some-team google artifact registry resource --- #

resource "google_artifact_registry_repository" "some-image-registry" {
  project       = var.project_id
  location      = "us"
  repository_id = "some-images"
  description   = "some repository"
  format        = "DOCKER"
}
