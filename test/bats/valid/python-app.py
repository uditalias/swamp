from time import sleep
from datetime import datetime
import logging
logging.basicConfig(level="DEBUG")

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info('Starting python app {0}'.format(datetime.now()))
    while True:
        sleep(1)
