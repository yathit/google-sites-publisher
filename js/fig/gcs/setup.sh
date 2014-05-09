#!/bin/sh

export BK=mbi-figure

gsutil mb gs://$BK
gsutil acl set acl.xml gs://$BK
gsutil setdefacl default-acl.xml gs://$BK
gsutil cors set cors.xml   gs://$BK