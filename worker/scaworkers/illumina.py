import json
from datetime import datetime

import scaworkers.utils as utils


# import scaworkers.illumina as illumina

def get_runs():
    command = ['bs', 'list', 'run', '-f', 'json']
    stdout, stderr = utils.execute(command)
    return json.loads(stdout)


def get_projects():
    command = ['bs', 'list', 'project', '-f', 'json']
    stdout, stderr = utils.execute(command)
    projects = json.loads(stdout)

    DATE_FORMAT = '%Y-%m-%dT%H:%M:%SZ'
    DATE_KEYS = ['DateModified']
    for project in projects:
        # Convert date strings to date objects
        for date_key in DATE_KEYS:
            date_str = project.get(date_key, '')
            try:
                project[date_key] = datetime.strptime(date_str, DATE_FORMAT)
            except ValueError:
                project[date_key] = None
        project['TotalSize'] = project.get('TotalSize', 0)

    valid_projects = [p for p in projects if p.get('Name', None) and p.get('Id', None) and p.get('DateModified', None)]
    return valid_projects


def download_project(project_name, download_dir):
    # '--overwrite'
    command = ['bs', 'download', 'project', '--name', project_name, '-o', str(download_dir), '--no-progress-bars']
    return utils.execute(command)