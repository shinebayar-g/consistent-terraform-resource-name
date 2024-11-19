moved {
  from = module.gke-cluster
  to   = module.foo.module.gke_cluster
}

moved {
  from = google_service_account.some-account
  to   = module.foo.google_service_account.some_account
}

moved {
  from = google_service_account_iam_member.sa-member
  to   = module.foo.google_service_account_iam_member.sa_member
}
